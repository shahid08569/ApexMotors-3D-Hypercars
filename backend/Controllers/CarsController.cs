using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CarsController : ControllerBase
{
    private readonly CarRepository _repository;

    public CarsController(CarRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public ActionResult<IEnumerable<CarModel>> GetAll()
    {
        return Ok(_repository.GetAllCars());
    }

    [HttpGet("{id}")]
    public ActionResult<CarModel> GetById(string id)
    {
        var car = _repository.GetCarById(id);
        if (car == null)
            return NotFound(new { message = $"Supercar with id '{id}' not found in showroom." });

        return Ok(car);
    }

    [HttpGet("{id}/hotspots")]
    public ActionResult<IEnumerable<CarHotspot>> GetHotspots(string id)
    {
        var car = _repository.GetCarById(id);
        if (car == null)
            return NotFound();

        return Ok(car.Hotspots);
    }

    [HttpGet("brands")]
    public ActionResult<IEnumerable<string>> GetBrands()
    {
        return Ok(_repository.GetBrands());
    }
}
