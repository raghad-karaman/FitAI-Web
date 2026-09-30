using AutoMapper;
using FitAI.Domain.Products;

namespace FitAI.Yorumlar
{
    public class YorumProfile : Profile
    {
        public YorumProfile()
        {
            CreateMap<Yorum, YorumDto>()
                .ForMember(dest => dest.UrunAdi,
                           opt => opt.MapFrom(src => src.Urun != null ? src.Urun.Ad : null))
                .ForMember(dest => dest.MagazaAdi,
                           opt => opt.MapFrom(src => src.Magaza != null ? src.Magaza.MagazaAdi : null));

            CreateMap<CreateUpdateYorumDto, Yorum>()
                .ForMember(dest => dest.NlpIslendi, opt => opt.Ignore())
                .ForMember(dest => dest.Duygu,      opt => opt.Ignore())
                .ForMember(dest => dest.GuvenSkoru, opt => opt.Ignore());
        }
    }
}