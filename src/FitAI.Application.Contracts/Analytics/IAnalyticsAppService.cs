using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace FitAI.Analytics;

public interface IAnalyticsAppService : IApplicationService
{
    Task<DashboardSummaryDto> GetStoreSummaryAsync(int magazaId);
    Task<List<SentimentAnalysisDto>> GetSentimentDistributionAsync(int magazaId);
    Task<List<SentimentAnalysisDto>> GetTopThemesAsync(int magazaId, int? urunId = null);
    Task<List<ReviewDto>> GetReviewsAsync(int magazaId, string? duyguEtiketi = null, int? urunId = null, int maxSayi = 10);
    Task<DashboardSummaryDto> GetDashboardSummaryAsync();
}