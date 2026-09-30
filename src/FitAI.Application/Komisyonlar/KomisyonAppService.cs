using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using FitAI.Domain.Commerce;

namespace FitAI.Komisyonlar
{
    public class KomisyonAppService :
        CrudAppService<KomisyonKaydi, KomisyonDto, int, PagedAndSortedResultRequestDto, CreateUpdateKomisyonDto>,
        IKomisyonAppService
    {
        public KomisyonAppService(IRepository<KomisyonKaydi, int> repository)
            : base(repository)
        {
        }

        public async Task<ListResultDto<KomisyonDto>> GetListByMagazaAsync(int magazaId)
        {
            var query = await Repository.GetQueryableAsync();
            var list = query
                .Where(k => k.MagazaId == magazaId)
                .OrderByDescending(k => k.IslemTarihi)
                .ToList();

            return new ListResultDto<KomisyonDto>(
                ObjectMapper.Map<List<KomisyonKaydi>, List<KomisyonDto>>(list)
            );
        }

        public async Task<ListResultDto<KomisyonDto>> GetListByDonemAsync(int yil, int ay)
        {
            var query = await Repository.GetQueryableAsync();
            var list = query
                .Where(k => k.DonemYil == yil && k.DonemAy == ay)
                .OrderByDescending(k => k.IslemTarihi)
                .ToList();

            return new ListResultDto<KomisyonDto>(
                ObjectMapper.Map<List<KomisyonKaydi>, List<KomisyonDto>>(list)
            );
        }

        protected override async Task<IQueryable<KomisyonKaydi>> CreateFilteredQueryAsync(
            PagedAndSortedResultRequestDto input)
        {
            var query = await base.CreateFilteredQueryAsync(input);
            return query.OrderByDescending(k => k.IslemTarihi);
        }
    }
}