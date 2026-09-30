using System;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using FitAI.Domain.Commerce;
using FitAI.Magazalar;
using Volo.Abp.Domain.Entities;
namespace FitAI.Magazalar
{
    public class MagazaAppService :
        CrudAppService<Magaza, MagazaDto, int, PagedAndSortedResultRequestDto, CreateUpdateMagazaDto>,
        IMagazaAppService
    {
        public MagazaAppService(IRepository<Magaza, int> repository)
            : base(repository)
        {
        }

        public async Task<MagazaDto> GetByEpostaAsync(string eposta)
        {
            // SORUN: magaza null olabilir, ama Map metodu null kabul etmiyor
            var magaza = await Repository.FirstOrDefaultAsync(m => m.Eposta == eposta);
            
            // ÇÖZÜM 1: Null kontrolü ekleyin (EN İYİ)
            if (magaza == null)
            {
                throw new EntityNotFoundException(typeof(Magaza), $"Eposta '{eposta}' ile mağaza bulunamadı");
            }
            
            return ObjectMapper.Map<Magaza, MagazaDto>(magaza);
            
            // ÇÖZÜM 2: Null coallescing ile varsayılan değer döndürün
            // return magaza != null 
            //     ? ObjectMapper.Map<Magaza, MagazaDto>(magaza) 
            //     : new MagazaDto();
        }

        protected override async Task<IQueryable<Magaza>> CreateFilteredQueryAsync(PagedAndSortedResultRequestDto input)
        {
            var query = await base.CreateFilteredQueryAsync(input);
            return query.Where(m => m.AktifMi);
        }

        public override async Task DeleteAsync(int id)
        {
            var magaza = await Repository.GetAsync(id);
            magaza.AktifMi = false;
            await Repository.UpdateAsync(magaza);
        }
    }
}