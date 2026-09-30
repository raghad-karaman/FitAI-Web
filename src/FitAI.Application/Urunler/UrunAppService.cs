using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using FitAI.Domain.Products;
using FitAI.Domain.Commerce;
using FitAI.Urunler;

namespace FitAI.Urunler
{
    public class UrunAppService :
        CrudAppService<Urun, UrunDto, int, PagedAndSortedResultRequestDto, CreateUpdateUrunDto>,
        IUrunAppService
    {
        public UrunAppService(IRepository<Urun, int> repository)
            : base(repository)
        {
        }

public async Task<List<UrunDto>> GetListByMagazaIdAsync(int magazaId)
{
    var queryable = await Repository.WithDetailsAsync(u => u.Magaza);
    var urunler = await queryable
        .Where(u => u.MagazaId == magazaId && !u.SilindiMi)
        .ToListAsync();

    return ObjectMapper.Map<List<Urun>, List<UrunDto>>(urunler);
}

        protected override async Task<IQueryable<Urun>> CreateFilteredQueryAsync(PagedAndSortedResultRequestDto input)
        {
            var query = await base.CreateFilteredQueryAsync(input);

            return query
                .Include(u => u.Magaza)
                .Where(u => !u.SilindiMi);
        }

        public override async Task<UrunDto> GetAsync(int id)
        {
            var queryable = await Repository.WithDetailsAsync(u => u.Magaza);
            var urun = await AsyncExecuter.FirstOrDefaultAsync(queryable.Where(u => u.Id == id));

            if (urun == null) throw new Volo.Abp.Domain.Entities.EntityNotFoundException(typeof(Urun), id);

            return ObjectMapper.Map<Urun, UrunDto>(urun);
        }

        public override async Task DeleteAsync(int id)
        {
            var urun = await Repository.GetAsync(id);
            urun.SilindiMi = true;
            await Repository.UpdateAsync(urun);
        }
    }
}