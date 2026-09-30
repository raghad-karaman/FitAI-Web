using AutoMapper;
using FitAI.Domain.Commerce;

namespace FitAI.Komisyonlar
{
    public class KomisyonProfile : Profile
    {
        public KomisyonProfile()
        {
            CreateMap<KomisyonKaydi, KomisyonDto>();
            CreateMap<CreateUpdateKomisyonDto, KomisyonKaydi>();
        }
    }
}