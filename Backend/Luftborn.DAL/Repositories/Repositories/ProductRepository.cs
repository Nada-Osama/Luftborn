using Luftborn.DAL.Context;
using Luftborn.DAL.Entities;
using Luftborn.DAL.Repositories.Contracts;

namespace Luftborn.DAL.Repositories.Repositories;

public class ProductRepository : RepositoryBase<Product>, IProductRepository
{
    public ProductRepository(LuftbornDbContext context) : base(context) { }

}
