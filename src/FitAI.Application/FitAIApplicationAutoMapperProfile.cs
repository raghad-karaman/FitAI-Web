using AutoMapper;
using FitAI.Domain.Commerce;
using FitAI.Domain.Products;
using FitAI.Magazalar;
using FitAI.Urunler;
using FitAI.Yorumlar;

namespace FitAI;

public class FitAIApplicationAutoMapperProfile : Profile
{
    public FitAIApplicationAutoMapperProfile()
    {
        CreateMap<Urun, UrunDto>()
            .ForMember(dest => dest.MagazaAdi, opt => opt.MapFrom(src => src.Magaza.MagazaAdi));

        CreateMap<CreateUpdateUrunDto, Urun>();

        CreateMap<Yorum, YorumDto>()
    .ForMember(dest => dest.UrunAdi, opt => opt.MapFrom(src => src.Urun.Ad));
        CreateMap<CreateUpdateYorumDto, Yorum>();

        CreateMap<Magaza, MagazaDto>();
        CreateMap<CreateUpdateMagazaDto, Magaza>();
    // ============================================================
// FitAIApplicationAutoMapperProfile.cs dosyasına ekleyin
// CreateMap bloklarının içine:
// ============================================================

// Yorum → YorumDto
CreateMap<FitAI.Domain.Products.Yorum, FitAI.Yorumlar.YorumDto>()
    .ForMember(d => d.UrunAdi,   o => o.MapFrom(s => s.Urun   != null ? s.Urun.Ad         : null))
    .ForMember(d => d.MagazaAdi, o => o.MapFrom(s => s.Magaza != null ? s.Magaza.MagazaAdi : null));

// CreateUpdateYorumDto → Yorum
CreateMap<FitAI.Yorumlar.CreateUpdateYorumDto, FitAI.Domain.Products.Yorum>()
    .ForMember(d => d.NlpIslendi, o => o.Ignore())
    .ForMember(d => d.Duygu,      o => o.Ignore())
    .ForMember(d => d.GuvenSkoru, o => o.Ignore());
    }

    
}