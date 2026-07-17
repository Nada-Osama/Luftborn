using Luftborn.DAL.Context;
using Microsoft.EntityFrameworkCore.Storage;

namespace Luftborn.DAL.Repositories.Contracts
{
    public interface IWrapperRepository
    {
        LuftbornDbContext RepositoryContext { get; }
        ICategoryRepository Category { get; }
        IProductRepository Product { get; }

        Task<IDbContextTransaction> BeginTransactionAsync();
        Task SaveAsync(CancellationToken cancellationToken = default);
    }
}
