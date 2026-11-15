using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InquiriesController : ControllerBase
{
    private readonly CarRepository _repository;

    public InquiriesController(CarRepository repository)
    {
        _repository = repository;
    }

    [HttpPost("test-drive")]
    public ActionResult RequestTestDrive([FromBody] TestDriveRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName) || string.IsNullOrWhiteSpace(request.Email))
            return BadRequest(new { message = "Full name and email are mandatory for VIP concierge booking." });

        _repository.AddTestDrive(request);
        return Ok(new
        {
            success = true,
            bookingReference = $"APEX-TD-{Guid.NewGuid().ToString()[..8].ToUpper()}",
            message = $"VIP Test Drive confirmed for {request.FullName}. A private chauffeur & showroom concierge will contact you shortly."
        });
    }

    [HttpPost("custom-build")]
    public ActionResult SaveCustomBuild([FromBody] CustomBuildRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CarId))
            return BadRequest(new { message = "Vehicle ID is required." });

        _repository.AddCustomBuild(request);
        return Ok(new
        {
            success = true,
            buildCode = $"BUILD-{Guid.NewGuid().ToString()[..8].ToUpper()}",
            message = "Your bespoke 3D hypercar build configuration has been saved and transmitted to the atelier."
        });
    }

    [HttpGet("test-drives")]
    public ActionResult<IEnumerable<TestDriveRequest>> GetTestDrives()
    {
        return Ok(_repository.GetTestDrives());
    }
}
