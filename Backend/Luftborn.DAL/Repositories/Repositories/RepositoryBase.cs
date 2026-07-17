using Luftborn.DAL.Context;
using Luftborn.DAL.Entities;
using Luftborn.DAL.Repositories.Contracts;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Luftborn.DAL.Repositories.Repositories
{
    public abstract class RepositoryBase<T> : IRepositoryBase<T> where T : class
    {
        protected LuftbornDbContext RepositoryContext { get; set; }

        public RepositoryBase(LuftbornDbContext repositoryContext)
        {
            RepositoryContext = repositoryContext;
        }

        public IQueryable<T> FindAll()
        {
            return RepositoryContext.Set<T>().AsNoTracking();
        }

        public IQueryable<T> FindByCondition(Expression<Func<T, bool>> expression, string? includeProperties = null)
        {
            IQueryable<T> query = RepositoryContext.Set<T>();

            if (!string.IsNullOrWhiteSpace(includeProperties))
            {
                foreach (var includeProp in includeProperties.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
                {
                    query = query.Include(includeProp.Trim());
                }
            }

            return query.Where(expression);
        }

        public async Task<T> FindByIdAsync(int id)
        {
            return await RepositoryContext.Set<T>().FindAsync(id);
        }

        public void Create(T entity)
        {
            RepositoryContext.Set<T>().Add(entity);
        }

        public void CreateBulk(IEnumerable<T> entities)
        {
            RepositoryContext.Set<T>().AddRange(entities);
        }

        public void Update(T entity)
        {
            RepositoryContext.Set<T>().Update(entity);
        }

        public void UpdateBulk(IEnumerable<T> entities)
        {
            RepositoryContext.Set<T>().UpdateRange(entities);
        }

        public void Delete(T entity)
        {
            RepositoryContext.Set<T>().Remove(entity);
        }

        public void DeleteBulk(IEnumerable<T> entities)
        {
            RepositoryContext.Set<T>().RemoveRange(entities);
        }

        public PagedResult<T> FindByConditionPager(
             int page,
             int pageSize,
             Expression<Func<T, bool>> expression,
             string? includeProperties = null,
             string? orderByColumn = null,
             bool isDescending = false,
             bool ignoreFilters = false)
        {
            try
            {
                var result = new PagedResult<T>();
                IQueryable<T> query = RepositoryContext.Set<T>().AsNoTracking();

                if (ignoreFilters)
                    query = query.IgnoreQueryFilters();

                if (!string.IsNullOrWhiteSpace(includeProperties))
                {
                    foreach (var includeProp in includeProperties.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
                    {
                        var trimmedProp = includeProp.Trim();
                        try
                        {
                            query = query.Include(trimmedProp);
                        }
                        catch (Exception ex)
                        {
                            throw new Exception($"Failed to include navigation property: '{trimmedProp}' for type '{typeof(T).Name}'", ex);
                        }
                    }
                }

                query = query.Where(expression);

                if (!string.IsNullOrWhiteSpace(orderByColumn))
                {
                    var param = Expression.Parameter(typeof(T), "x");
                    IOrderedQueryable<T>? orderedQuery = null;

                    var columns = orderByColumn.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries).Select(c => c.Trim());
                    foreach (var column in columns)
                    {
                        Expression property = param;
                        foreach (var member in column.Split('.'))
                        {
                            property = Expression.PropertyOrField(property, member);
                        }

                        if (property.Type == typeof(string))
                        {
                            property = Expression.Call(property, typeof(string).GetMethod("ToLower", Type.EmptyTypes)!);
                        }

                        var lambda = Expression.Lambda(property, param);

                        if (orderedQuery == null)
                        {
                            // First order column 
                            string methodName = isDescending ? "OrderByDescending" : "OrderBy";

                            var method = typeof(Queryable).GetMethods()
                                .First(m => m.Name == methodName && m.GetParameters().Length == 2)
                                .MakeGenericMethod(typeof(T), property.Type);

                            orderedQuery = (IOrderedQueryable<T>)method.Invoke(null, new object[] { query, lambda })!;
                        }
                        else
                        {
                            // Subsequent order columns 
                            string methodName = isDescending ? "ThenByDescending" : "ThenBy";

                            var method = typeof(Queryable).GetMethods()
                                .First(m => m.Name == methodName && m.GetParameters().Length == 2)
                                .MakeGenericMethod(typeof(T), property.Type);

                            orderedQuery = (IOrderedQueryable<T>)method.Invoke(null, new object[] { orderedQuery, lambda })!;
                        }
                    }

                    if (orderedQuery != null)
                        query = orderedQuery;
                }

                result.CurrentPage = page;
                result.PageSize = pageSize;
                result.RowCount = query.Count();
                result.PageCount = (int)Math.Ceiling((double)result.RowCount / pageSize);
                result.Results = query.Skip((page - 1) * pageSize).Take(pageSize).ToList();

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error in FindByConditionPager<{typeof(T).Name}>: {ex.Message}", ex);
            }
        }

        public void Dispose()
        {
            RepositoryContext.Dispose();
        }

    }
}
