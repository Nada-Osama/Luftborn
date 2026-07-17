using Luftborn.BLL.DTOs;
using Luftborn.DAL.Entities;

namespace Luftborn.BLL.Services.Contracts;

public interface ICategoryService
{
    PagedResult<CategoryDTO> GetAllPager(int pageSize, int pageNumber, string? keyword = "");
    Task<CategoryDTO> GetByIdAsync(int id);
    Task<ResponseModel> CreateAsync(CategoryDTO dto);
    Task<ResponseModel> UpdateAsync(CategoryDTO dto);
    Task DeleteAsync(int id);
}
