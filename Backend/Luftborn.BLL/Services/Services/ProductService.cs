using Luftborn.BLL.DTOs;
using Luftborn.BLL.Exceptions;
using Luftborn.BLL.Mapping;
using Luftborn.BLL.Services.Contracts;
using Luftborn.DAL.Entities;
using Luftborn.DAL.Repositories.Contracts;
using Microsoft.EntityFrameworkCore;

namespace Luftborn.BLL.Services.Services;

public class ProductService : IProductService
{
    private readonly IWrapperRepository _repo;

    public ProductService(IWrapperRepository repo)
    {
        _repo = repo;
    }

    public PagedResult<ProductDTO> GetAllPager(int pageSize, int pageNumber, string? keyword = "")
    {
        var products = _repo.Product.FindByConditionPager(
            page: pageNumber,
            pageSize: pageSize,
            expression: b => string.IsNullOrEmpty(keyword) || b.Name.ToLower().Contains(keyword.ToLower()),
            includeProperties: "Category",
            orderByColumn: "Name",
            isDescending: false
        );

        var dtos = products.Results.Select(c => c.ToDto()).ToList();

        return new PagedResult<ProductDTO>
        {
            Results = dtos,
            CurrentPage = products.CurrentPage,
            PageCount = products.PageCount,
            PageSize = products.PageSize,
            RowCount = products.RowCount
        };
    }

    public async Task<ProductDTO> GetByIdAsync(int id)
    {
        var product = await _repo.Product.FindByCondition(p => p.ProductId == id, "Category").AsNoTracking().FirstOrDefaultAsync() 
            ?? throw new NotFoundException(nameof(Product), id);
        return product.ToDto();
    }

    public async Task<ResponseModel> CreateAsync(ProductDTO dto)
    {
        var exists = _repo.Product.FindByCondition(b => b.Name == dto.Name).Any();
        if (exists)
            return new ResponseModel { Success = false, Message = "Name already exists" };

        var product = new Product();
        dto.ApplyTo(product);
        product.CreationDate = DateTime.Now;

        _repo.Product.Create(product);
        await _repo.SaveAsync();

        return new ResponseModel { Success = true, Message = "Added Successfully" };
    }

    public async Task<ResponseModel> UpdateAsync(ProductDTO dto)
    {
        var product = await _repo.Product.FindByIdAsync(dto.ProductId) ?? throw new NotFoundException(nameof(Product), dto.ProductId);

        var duplicate = _repo.Product.FindByCondition(b => b.ProductId != dto.ProductId && b.Name == dto.Name).Any();
        if (duplicate)
            return new ResponseModel { Success = false, Message = "Name already exists" };

        dto.ApplyTo(product);
        product.ModifyDate = DateTime.Now;

        _repo.Product.Update(product);
        await _repo.SaveAsync();

        return new ResponseModel { Success = true, Message = "Updated Successfully" };
    }

    public async Task DeleteAsync(int id)
    {
        var product = await _repo.Product.FindByIdAsync(id) ?? throw new NotFoundException(nameof(Product), id);
        _repo.Product.Delete(product);
        await _repo.SaveAsync();
    }

}
