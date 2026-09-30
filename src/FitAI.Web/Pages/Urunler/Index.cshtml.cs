using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Rendering;
using FitAI.Urunler;
using FitAI.Magazalar;
using Volo.Abp.Application.Dtos;

namespace FitAI.Web.Pages.Urunler;

public class IndexModel : FitAI.Web.Pages.FitAIPageModel
{
    private readonly IUrunAppService _urunAppService;
    private readonly IMagazaAppService _magazaAppService;

    public List<SelectListItem> MagazaListesi { get; set; } = new();

    public IndexModel(IUrunAppService urunAppService, IMagazaAppService magazaAppService)
    {
        _urunAppService = urunAppService;
        _magazaAppService = magazaAppService;
    }

    public async Task OnGetAsync()
    {
        var magazalar = await _magazaAppService.GetListAsync(new PagedAndSortedResultRequestDto 
        { 
            MaxResultCount = 1000 
        });
        
        MagazaListesi = magazalar.Items.Select(x => new SelectListItem(x.MagazaAdi, x.Id.ToString())).ToList();
    }
}