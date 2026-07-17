using Luftborn.API.Authorization;
using Luftborn.BLL.DTOs;
using Luftborn.BLL.Services.Contracts;
using Luftborn.DAL.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Luftborn.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = SSOPolicy.Name)]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet("GetAllPager")]
    public ActionResult<PagedResult<ProductDTO>> GetAllPager(int pageSize = 10, int pageNumber = 1, string? keyword = "")
        => Ok(_productService.GetAllPager(pageSize, pageNumber, keyword));

    [HttpGet("GetById/{id}")]
    public async Task<ActionResult<ProductDTO>> GetById(int id)
        => Ok(await _productService.GetByIdAsync(id));

    [HttpPost("Create")]
    public async Task<ActionResult<ResponseModel>> Create(ProductDTO dto)
        => Ok(await _productService.CreateAsync(dto));

    [HttpPut("Update")]
    public async Task<ActionResult<ProductDTO>> Update(ProductDTO dto)
        => Ok(await _productService.UpdateAsync(dto));

    [HttpDelete("Delete/{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _productService.DeleteAsync(id);
        return NoContent();
    }

}
