using Luftborn.BLL.DTOs;
using Luftborn.DAL.Entities;

namespace Luftborn.BLL.Mapping;

/// <summary>
/// A mapping library (AutoMapper)
/// would work here too, but you mentioned that importing libraries has to be for a good reason
/// and no need for it for only two entities
/// </summary>
public static class MappingExtensions
{
    public static ProductDTO ToDto(this Product product)
    {
        return new ProductDTO
        {
            ProductId = product.ProductId,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            Quantity = product.Quantity,
            IsActive = product.IsActive,
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.Name ?? string.Empty
        };
    }

    public static void ApplyTo(this ProductDTO dto, Product product)
    {
        product.Name = dto.Name.Trim();
        product.Description = dto.Description?.Trim();
        product.Price = dto.Price;
        product.Quantity = dto.Quantity;
        product.IsActive = dto.IsActive;
        product.CategoryId = dto.CategoryId;
    }

    public static CategoryDTO ToDto(this Category category)
    {
        return new CategoryDTO
        {
            CategoryId = category.CategoryId,
            Name = category.Name,
            Description = category.Description
        };
    }

    public static void ApplyTo(this CategoryDTO dto, Category category)
    {
        category.Name = dto.Name.Trim();
        category.Description = dto.Description?.Trim();
    }

}
