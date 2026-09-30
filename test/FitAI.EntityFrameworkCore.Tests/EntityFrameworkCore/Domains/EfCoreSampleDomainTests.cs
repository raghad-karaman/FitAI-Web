using FitAI.Samples;
using Xunit;

namespace FitAI.EntityFrameworkCore.Domains;

[Collection(FitAITestConsts.CollectionDefinitionName)]
public class EfCoreSampleDomainTests : SampleDomainTests<FitAIEntityFrameworkCoreTestModule>
{

}
