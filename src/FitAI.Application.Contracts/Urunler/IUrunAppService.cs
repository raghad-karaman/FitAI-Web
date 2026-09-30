using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace FitAI.Urunler
{
    public interface IUrunAppService :
        ICrudAppService<UrunDto, int, PagedAndSortedResultRequestDto, CreateUpdateUrunDto>
    {
        Task<List<UrunDto>> GetListByMagazaIdAsync(int magazaId);
    }

    
}