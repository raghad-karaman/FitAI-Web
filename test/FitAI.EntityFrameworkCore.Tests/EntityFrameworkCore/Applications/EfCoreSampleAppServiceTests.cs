using FitAI.Samples;
using Xunit;

namespace FitAI.EntityFrameworkCore.Applications;

[Collection(FitAITestConsts.CollectionDefinitionName)]
public class EfCoreSampleAppServiceTests : SampleAppServiceTests<FitAIEntityFrameworkCoreTestModule>
{

}
