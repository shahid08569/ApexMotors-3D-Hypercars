using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ShowroomController : ControllerBase
{
    private readonly CarRepository _repository;

    public ShowroomController(CarRepository repository)
    {
        _repository = repository;
    }

    [HttpGet("stats")]
    public ActionResult<ShowroomStats> GetStats()
    {
        return Ok(_repository.GetStats());
    }
}
