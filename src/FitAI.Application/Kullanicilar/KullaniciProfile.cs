using AutoMapper;
using FitAI.Domain.Users;

namespace FitAI.Kullanicilar
{
    public class KullaniciProfile : Profile
    {
        public KullaniciProfile()
        {
            CreateMap<Kullanici, KullaniciDto>()
                .ForMember(dest => dest.MagazaAdi, opt => opt.Ignore()); // Magaza navigation yok, AppService'de doldurulacak

            CreateMap<CreateUpdateKullaniciDto, Kullanici>()
                .ForMember(dest => dest.SifreHash, opt => opt.Ignore()); // Hash AppService'de hesaplanacak
        }
    }
}