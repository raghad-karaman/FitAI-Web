using Volo.Abp.Settings;

namespace FitAI.Settings;

public class FitAISettingDefinitionProvider : SettingDefinitionProvider
{
    public override void Define(ISettingDefinitionContext context)
    {
        //Define your own settings here. Example:
        //context.Add(new SettingDefinition(FitAISettings.MySetting1));
    }
}
