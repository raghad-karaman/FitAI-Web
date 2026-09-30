using System.Threading.Tasks;
using FitAI.Komisyonlar;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.AspNetCore.Mvc.UI.RazorPages;

namespace FitAI.Web.Pages.Komisyonlar
{
    public class IndexModel : AbpPageModel
    {
        [BindProperty]
        public CreateUpdateKomisyonDto CreateUpdateKomisyon { get; set; } = new();

        private readonly IKomisyonAppService _komisyonAppService;

        public IndexModel(IKomisyonAppService komisyonAppService)
        {
            _komisyonAppService = komisyonAppService;
        }

        public void OnGet()
        {
        }

        public async Task<IActionResult> OnPostAsync()
        {
            await _komisyonAppService.CreateAsync(CreateUpdateKomisyon);
            return NoContent();
        }

        public async Task<IActionResult> OnPostUpdateAsync(int id)
        {
            await _komisyonAppService.UpdateAsync(id, CreateUpdateKomisyon);
            return NoContent();
        }

        public async Task<IActionResult> OnPostDeleteAsync(int id)
        {
            await _komisyonAppService.DeleteAsync(id);
            return NoContent();
        }
    }
}