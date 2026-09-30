using AutoMapper;
using FitAI.Domain.Notifications;

namespace FitAI.Bildirimler;

public class BildirimProfile : Profile
{
    public BildirimProfile()
    {
        CreateMap<Bildirim, BildirimDto>();
        CreateMap<CreateBildirimDto, Bildirim>();
    }
}