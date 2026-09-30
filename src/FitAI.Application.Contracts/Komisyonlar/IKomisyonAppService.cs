using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace FitAI.Komisyonlar
{
    public interface IKomisyonAppService :
        ICrudAppService<KomisyonDto, int, PagedAndSortedResultRequestDto, CreateUpdateKomisyonDto>
    {
        Task<ListResultDto<KomisyonDto>> GetListByMagazaAsync(int magazaId);
        Task<ListResultDto<KomisyonDto>> GetListByDonemAsync(int yil, int ay);
    }
}