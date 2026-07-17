using Luftborn.DAL.Context;
using Luftborn.DAL.Repositories.Contracts;
using Microsoft.EntityFrameworkCore.Storage;

namespace Luftborn.DAL.Repositories.Repositories
{
    public class WrapperRepository : IWrapperRepository
    {
        private readonly LuftbornDbContext _repoContext;
        public LuftbornDbContext RepositoryContext => _repoContext;


        private ICategoryRepository _CategoryRepository;
        public ICategoryRepository Category
        {
            get
            {
                if (_CategoryRepository == null)
                {
                    _CategoryRepository = new CategoryRepository(_repoContext);
                }
                return _CategoryRepository;
            }
        }

        private IProductRepository _ProductRepository;
        public IProductRepository Product
        {
            get
            {
                if (_ProductRepository == null)
                {
                    _ProductRepository = new ProductRepository(_repoContext);
                }
                return _ProductRepository;
            }
        }

        public WrapperRepository(LuftbornDbContext repositoryContext)
        {
            _repoContext = repositoryContext;
        }

        public async Task<IDbContextTransaction> BeginTransactionAsync()
        {
            return await _repoContext.Database.BeginTransactionAsync();
        }

        public async Task SaveAsync(CancellationToken cancellationToken = default)
        {
            await _repoContext.SaveChangesAsync(cancellationToken);
        }

    }
}
