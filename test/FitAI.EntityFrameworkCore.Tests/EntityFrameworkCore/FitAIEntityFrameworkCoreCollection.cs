using Xunit;

namespace FitAI.EntityFrameworkCore;

[CollectionDefinition(FitAITestConsts.CollectionDefinitionName)]
public class FitAIEntityFrameworkCoreCollection : ICollectionFixture<FitAIEntityFrameworkCoreFixture>
{

}
