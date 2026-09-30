using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace FitAI.Analytics;

[Route("api/app/analytics")]
public class AnalyticsAppService : FitAI.FitAIAppService, IAnalyticsAppService
{
    [HttpGet("store-summary")]
    public Task<DashboardSummaryDto> GetStoreSummaryAsync(int magazaId)
    {
        return Task.FromResult(new DashboardSummaryDto
        {
            ToplamUrunSayisi          = 0,
            ToplamYorumSayisi         = 0,
            MagazaPuanOrtalamasi      = 0,
            IslenmeyiBekleyenYorumlar = 0
        });
    }

    [HttpGet("dashboard-summary")]
    public Task<DashboardSummaryDto> GetDashboardSummaryAsync()
    {
        return Task.FromResult(new DashboardSummaryDto
        {
            ToplamUrunSayisi          = 0,
            ToplamYorumSayisi         = 0,
            MagazaPuanOrtalamasi      = 0,
            IslenmeyiBekleyenYorumlar = 0
        });
    }

    [HttpGet("sentiment-distribution")]
    public Task<List<SentimentAnalysisDto>> GetSentimentDistributionAsync(int magazaId)
    {
        return Task.FromResult(new List<SentimentAnalysisDto>
        {
            new() { Etiket = "Pozitif",  Sayi = 0, Yuzde = 0 },
            new() { Etiket = "Negatif",  Sayi = 0, Yuzde = 0 },
            new() { Etiket = "Belirsiz", Sayi = 0, Yuzde = 0 }
        });
    }

    [HttpGet("top-themes")]
    public Task<List<SentimentAnalysisDto>> GetTopThemesAsync(int magazaId, int? urunId = null)
    {
        return Task.FromResult(new List<SentimentAnalysisDto>());
    }

    [HttpGet("reviews")]
    public Task<List<ReviewDto>> GetReviewsAsync(
        int     magazaId,
        string? duyguEtiketi = null,
        int?    urunId       = null,
        int     maxSayi      = 10)
    {
        return Task.FromResult(new List<ReviewDto>());
    }
}