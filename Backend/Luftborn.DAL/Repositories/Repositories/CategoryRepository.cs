using Luftborn.DAL.Context;
using Luftborn.DAL.Entities;
using Luftborn.DAL.Repositories.Contracts;

namespace Luftborn.DAL.Repositories.Repositories;

public class CategoryRepository : RepositoryBase<Category>, ICategoryRepository
{
    public CategoryRepository(LuftbornDbContext context) : base(context) { }
}
