using Luftborn.DAL.Context;
using Luftborn.DAL.Entities;
using Microsoft.EntityFrameworkCore;

namespace Luftborn.DAL.Seed;

public static class DataSeeder
{
    public static async Task SeedAsync(LuftbornDbContext context, CancellationToken cancellationToken = default)
    {
        if (await context.Categories.AnyAsync(cancellationToken))
        {
            return; // already seeded
        }

        var footwear = new Category { Name = "Footwear", Description = "Shoes, sandals and boots" };
        var apparel = new Category { Name = "Apparel", Description = "Shirts, jackets and trousers" };
        var accessories = new Category { Name = "Accessories", Description = "Bags, belts and small items" };

        context.Categories.AddRange(footwear, apparel, accessories);
        await context.SaveChangesAsync(cancellationToken);

        context.Products.AddRange(
            new Product
            {
                Name = "Trail Runner Sandal",
                Description = "Lightweight outdoor sandal",
                Price = 49.99m,
                Quantity = 120,
                IsActive = true,
                CategoryId = footwear.CategoryId,
                CreationDate = DateTime.Now,
            },
            new Product
            {
                Name = "Urban Sneaker",
                Description = "Everyday casual sneaker",
                Price = 64.50m,
                Quantity = 80,
                IsActive = true,
                CategoryId = footwear.CategoryId,
                CreationDate = DateTime.Now,
            },
            new Product
            {
                Name = "Windbreaker Jacket",
                Description = "Water resistant shell",
                Price = 89.00m,
                Quantity = 40,
                IsActive = true,
                CategoryId = apparel.CategoryId,
                CreationDate = DateTime.Now,
            },
            new Product
            {
                Name = "Canvas Belt",
                Description = "Adjustable canvas belt",
                Price = 19.99m,
                Quantity = 200,
                IsActive = true,
                CategoryId = accessories.CategoryId,
                CreationDate = DateTime.Now,
            });

        await context.SaveChangesAsync(cancellationToken);
    }
}
