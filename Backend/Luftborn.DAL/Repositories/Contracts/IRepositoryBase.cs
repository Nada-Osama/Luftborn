using Luftborn.DAL.Entities;
using System.Linq.Expressions;

namespace Luftborn.DAL.Repositories.Contracts
{
    public interface IRepositoryBase<T> : IDisposable
    {
        IQueryable<T> FindAll();
        IQueryable<T> FindByCondition(Expression<Func<T, bool>> expression, string? includeProperties = null);
        Task<T> FindByIdAsync(int id);
        void Create(T entity);
        void CreateBulk(IEnumerable<T> entities);
        void Update(T entity);
        void UpdateBulk(IEnumerable<T> entities);
        void Delete(T entity);
        void DeleteBulk(IEnumerable<T> entities);
        PagedResult<T> FindByConditionPager(
            int page,
            int pageSize,
            Expression<Func<T, bool>> expression,
            string? includeProperties = null,
            string? orderByColumn = null,
            bool isDescending = false,
            bool ignoreFilters = false);

    }
}
