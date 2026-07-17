namespace Luftborn.BLL.DTOs;

public class ProductDTO
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public bool IsActive { get; set; } = true;
    public int CategoryId { get; set; }
    public string? CategoryName { get; set; }

}
