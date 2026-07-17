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
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet("GetAllPager")]
    public ActionResult<PagedResult<CategoryDTO>> GetAllPager(int pageSize = 10, int pageNumber = 1, string? keyword = "")
        => Ok(_categoryService.GetAllPager(pageSize, pageNumber, keyword));
    
    [HttpGet("GetById/{id}")]
    public async Task<ActionResult<CategoryDTO>> GetById(int id)
        => Ok(await _categoryService.GetByIdAsync(id));

    [HttpPost("Create")]
    public async Task<ActionResult<ResponseModel>> Create(CategoryDTO dto)
        => Ok(await _categoryService.CreateAsync(dto));

    [HttpPut("Update")]
    public async Task<ActionResult<CategoryDTO>> Update(CategoryDTO dto)
        => Ok(await _categoryService.UpdateAsync(dto));

    [HttpDelete("Delete/{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _categoryService.DeleteAsync(id);
        return NoContent();
    }

}
