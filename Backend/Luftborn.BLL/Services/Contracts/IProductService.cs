using Luftborn.BLL.DTOs;
using Luftborn.DAL.Entities;

namespace Luftborn.BLL.Services.Contracts;

public interface IProductService
{
    PagedResult<ProductDTO> GetAllPager(int pageSize, int pageNumber, string? keyword = "");
    Task<ProductDTO> GetByIdAsync(int id);
    Task<ResponseModel> CreateAsync(ProductDTO dto);
    Task<ResponseModel> UpdateAsync(ProductDTO dto);
    Task DeleteAsync(int id);

}
