using System.Threading.Tasks;
using FitAI.Localization;
using FitAI.MultiTenancy;
using Volo.Abp.Identity.Web.Navigation;
using Volo.Abp.SettingManagement.Web.Navigation;
using Volo.Abp.TenantManagement.Web.Navigation;
using Volo.Abp.UI.Navigation;

namespace FitAI.Web.Menus;

public class FitAIMenuContributor : IMenuContributor
{
    public async Task ConfigureMenuAsync(MenuConfigurationContext context)
    {
        if (context.Menu.Name == StandardMenus.Main)
        {
            await ConfigureMainMenuAsync(context);
        }
    }

    private Task ConfigureMainMenuAsync(MenuConfigurationContext context)
    {
        var administration = context.Menu.GetAdministration();
        var l = context.GetLocalizer<FitAIResource>();

        // Ana Sayfa / Dashboard
        context.Menu.Items.Insert(
            0,
            new ApplicationMenuItem(
                FitAIMenus.Home,
                l["Menu:Home"],
                "~/",
                icon: "fas fa-chart-pie",
                order: 0
            )
        );

        // Mağazalar
        context.Menu.Items.Insert(
            1,
            new ApplicationMenuItem(
                "FitAI.Magazalar",
                "Mağazalar",
                "~/Magazalar",
                icon: "fas fa-store",
                order: 1
            )
        );

        // Ürünler
        context.Menu.Items.Insert(
            2,
            new ApplicationMenuItem(
                "FitAI.Urunler",
                "Ürünler",
                "~/Urunler",
                icon: "fas fa-tshirt",
                order: 2
            )
        );

        // Kullanıcılar
        context.Menu.Items.Insert(
            3,
            new ApplicationMenuItem(
                "FitAI.Kullanicilar",
                "Kullanıcılar",
                "~/Kullanicilar",
                icon: "fas fa-users",
                order: 3
            )
        );

        // AI & Analiz
        context.Menu.Items.Insert(
            4,
            new ApplicationMenuItem(
                "FitAI.Analiz",
                "AI & Analiz",
                "~/Analiz",
                icon: "fas fa-brain",
                order: 4
            )
        );

        // Komisyonlar
        context.Menu.Items.Insert(
            5,
            new ApplicationMenuItem(
                "FitAI.Komisyonlar",
                "Komisyonlar",
                "~/Komisyonlar",
                icon: "fas fa-lira-sign",
                order: 5
            )
        );

        // Bildirimler
        context.Menu.Items.Insert(
            6,
            new ApplicationMenuItem(
                "FitAI.Bildirimler",
                "Bildirimler",
                "~/Bildirimler",
                icon: "fas fa-bell",
                order: 6
            )
        );

        // Talimatlar
        context.Menu.Items.Insert(
            7,
            new ApplicationMenuItem(
                "FitAI.Talimatlar",
                "Talimatlar",
                "~/Talimatlar",
                icon: "fas fa-microchip",
                order: 7
            )
        );

        // Yorumlar
        context.Menu.Items.Insert(
            8,
            new ApplicationMenuItem(
                "FitAI.Yorumlar",
                "Yorumlar",
                "~/Yorumlar",
                icon: "fas fa-comments",
                order: 8
            )
        );

        if (MultiTenancyConsts.IsEnabled)
        {
            administration.SetSubItemOrder(TenantManagementMenuNames.GroupName, 1);
        }
        else
        {
            administration.TryRemoveMenuItem(TenantManagementMenuNames.GroupName);
        }

        administration.SetSubItemOrder(IdentityMenuNames.GroupName, 2);
        administration.SetSubItemOrder(SettingManagementMenuNames.GroupName, 3);

        return Task.CompletedTask;
    }
}