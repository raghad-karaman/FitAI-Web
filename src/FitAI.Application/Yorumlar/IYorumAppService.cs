using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace FitAI.Yorumlar
{
    public interface IYorumAppService :
        ICrudAppService<YorumDto, int, YorumGetListInput, CreateUpdateYorumDto>
    {
        Task<List<YorumDto>> GetListByUrunIdAsync(int urunId);
        Task<YorumDto> TriggerNlpAsync(int id);
    }
}