using FitAI.Localization;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Localization;

namespace FitAI.Permissions;

public class FitAIPermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        var myGroup = context.AddGroup(FitAIPermissions.GroupName);
        //Define your own permissions here. Example:
        //myGroup.AddPermission(FitAIPermissions.MyPermission1, L("Permission:MyPermission1"));
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<FitAIResource>(name);
    }
}
