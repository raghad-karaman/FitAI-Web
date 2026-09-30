using AutoMapper;
using FitAI.Domain.Products;

namespace FitAI.Urunler
{
    public class UrunProfile : Profile
    {
        public UrunProfile()
        {
            CreateMap<Urun, UrunDto>()
                .ForMember(dest => dest.MagazaAdi, 
                           opt => opt.MapFrom(src => src.Magaza != null ? src.Magaza.MagazaAdi : null));

            CreateMap<CreateUpdateUrunDto, Urun>();
        }
    }
}