using Luftborn.BLL.DTOs;
using Luftborn.BLL.Exceptions;
using Luftborn.BLL.Mapping;
using Luftborn.BLL.Services.Contracts;
using Luftborn.DAL.Entities;
using Luftborn.DAL.Repositories.Contracts;
using Microsoft.EntityFrameworkCore;

namespace Luftborn.BLL.Services.Services;

public class CategoryService : ICategoryService
{
    private readonly IWrapperRepository _repo;

    public CategoryService(IWrapperRepository repo)
    {
        _repo = repo;
    }

    public PagedResult<CategoryDTO> GetAllPager(int pageSize, int pageNumber, string? keyword = "")
    {
        var categories = _repo.Category.FindByConditionPager(
            page: pageNumber,
            pageSize: pageSize,
            expression: b => string.IsNullOrEmpty(keyword) || b.Name.ToLower().Contains(keyword.ToLower()),
            orderByColumn: "Name",
            isDescending: false
        );

        var dtos = categories.Results.Select(c => c.ToDto()).ToList();

        return new PagedResult<CategoryDTO>
        {
            Results = dtos,
            CurrentPage = categories.CurrentPage,
            PageCount = categories.PageCount,
            PageSize = categories.PageSize,
            RowCount = categories.RowCount
        };
    }

    public async Task<CategoryDTO> GetByIdAsync(int id)
    {
        var category = await _repo.Category.FindByIdAsync(id) ?? throw new NotFoundException(nameof(Category), id);
        return category.ToDto();
    }

    public async Task<ResponseModel> CreateAsync(CategoryDTO dto)
    {
        var exists = _repo.Category.FindByCondition(b => b.Name == dto.Name).Any();
        if (exists)
            return new ResponseModel { Success = false, Message = "Name already exists" };

        var category = new Category();
        dto.ApplyTo(category);
        category.CreationDate = DateTime.Now;

        _repo.Category.Create(category);
        await _repo.SaveAsync();

        return new ResponseModel { Success = true, Message = "Added Successfully" };
    }

    public async Task<ResponseModel> UpdateAsync(CategoryDTO dto)
    {
        var category = await _repo.Category.FindByIdAsync(dto.CategoryId) ?? throw new NotFoundException(nameof(Category), dto.CategoryId);

        var duplicate = _repo.Category.FindByCondition(b => b.CategoryId != dto.CategoryId && b.Name == dto.Name).Any();
        if (duplicate)
            return new ResponseModel { Success = false, Message = "Name already exists" };

        dto.ApplyTo(category);

        _repo.Category.Update(category);
        await _repo.SaveAsync();

        return new ResponseModel { Success = true, Message = "Updated Successfully" };
    }

    public async Task DeleteAsync(int id)
    {
        var category = await _repo.Category.FindByIdAsync(id) ?? throw new NotFoundException(nameof(Category), id);

        var hasProducts = await _repo.Product.FindByCondition(p => p.CategoryId == id).AnyAsync();
        if (hasProducts)
        {
            throw new BusinessRuleException("Cannot delete a category that still has products assigned to it.");
        }

        _repo.Category.Delete(category);
        await _repo.SaveAsync();
    }

}
