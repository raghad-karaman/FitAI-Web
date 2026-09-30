using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using FitAI.Magazalar;

namespace FitAI.Magazalar
{
    public interface IMagazaAppService :
        ICrudAppService<MagazaDto, int, PagedAndSortedResultRequestDto, CreateUpdateMagazaDto>
    {
        Task<MagazaDto> GetByEpostaAsync(string eposta);
    }
}