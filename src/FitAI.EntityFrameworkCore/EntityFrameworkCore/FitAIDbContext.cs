using FitAI.Domain.Ai;
using FitAI.Domain.Analytics;
using FitAI.Domain.Commerce;
using FitAI.Domain.Integration;
using FitAI.Domain.Notifications;
using FitAI.Domain.Onboarding;
using FitAI.Domain.Products;
using FitAI.Domain.Scoring;
using FitAI.Domain.Users;

using Microsoft.EntityFrameworkCore;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore.Modeling;

using Volo.Abp.Identity;
using Volo.Abp.Identity.EntityFrameworkCore;

using Volo.Abp.OpenIddict.EntityFrameworkCore;
using Volo.Abp.PermissionManagement.EntityFrameworkCore;
using Volo.Abp.SettingManagement.EntityFrameworkCore;

using Volo.Abp.TenantManagement;
using Volo.Abp.TenantManagement.EntityFrameworkCore;
using Volo.Abp.BackgroundJobs.EntityFrameworkCore;
using Volo.Abp.FeatureManagement.EntityFrameworkCore;

namespace FitAI.EntityFrameworkCore;

[ConnectionStringName("Default")]
[ReplaceDbContext(typeof(IIdentityDbContext))]
[ReplaceDbContext(typeof(ITenantManagementDbContext))]
[ReplaceDbContext(typeof(IFeatureManagementDbContext))]
public class FitAIDbContext :
    AbpDbContext<FitAIDbContext>,
    IIdentityDbContext,
    ITenantManagementDbContext,
    IFeatureManagementDbContext
{
    // ================= DOMAIN =================

    public DbSet<Magaza> Magazalar => Set<Magaza>();
    public DbSet<Kullanici> Kullanicilar => Set<Kullanici>();
    public DbSet<KullaniciProfil> KullaniciProfilleri => Set<KullaniciProfil>();

    public DbSet<Urun> Urunler => Set<Urun>();
    public DbSet<Yorum> Yorumlar => Set<Yorum>();

    public DbSet<PlatformBaglantisi> PlatformBaglantilari => Set<PlatformBaglantisi>();
    public DbSet<SenkronizasyonLog> SenkronizasyonLoglari => Set<SenkronizasyonLog>();

    public DbSet<AiTalimat> AiTalimatlar => Set<AiTalimat>();
    public DbSet<NlpBulgusu> NlpBulgulari => Set<NlpBulgusu>();

    public DbSet<Bildirim> Bildirimler => Set<Bildirim>();
    public DbSet<OnboardingAdim> OnboardingAdimlari => Set<OnboardingAdim>();

    public DbSet<KomisyonKaydi> KomisyonKayitlari => Set<KomisyonKaydi>();
    public DbSet<VucutUyumSkoru> VucutUyumSkorlari => Set<VucutUyumSkoru>();

    public DbSet<WidgetSorguLog> WidgetSorguLoglari => Set<WidgetSorguLog>();

    // ================= ABP =================

    public DbSet<IdentityUser> Users { get; set; } = null!;
    public DbSet<IdentityRole> Roles { get; set; } = null!;
    public DbSet<IdentityClaimType> ClaimTypes { get; set; } = null!;
    public DbSet<OrganizationUnit> OrganizationUnits { get; set; } = null!;
    public DbSet<IdentitySecurityLog> SecurityLogs { get; set; } = null!;
    public DbSet<IdentityLinkUser> LinkUsers { get; set; } = null!;
    public DbSet<IdentityUserDelegation> UserDelegations { get; set; } = null!;
    public DbSet<IdentitySession> Sessions { get; set; } = null!;

    public DbSet<Tenant> Tenants { get; set; } = null!;
    public DbSet<TenantConnectionString> TenantConnectionStrings { get; set; } = null!;

    // ================= FEATURE MANAGEMENT =================
    public DbSet<Volo.Abp.FeatureManagement.FeatureGroupDefinitionRecord> FeatureGroups { get; set; } = null!;
    public DbSet<Volo.Abp.FeatureManagement.FeatureDefinitionRecord> Features { get; set; } = null!;
    public DbSet<Volo.Abp.FeatureManagement.FeatureValue> FeatureValues { get; set; } = null!;

    public FitAIDbContext(DbContextOptions<FitAIDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // ================= ABP MODULES =================
        builder.ConfigureIdentity();
        builder.ConfigureOpenIddict();
        builder.ConfigurePermissionManagement();
        builder.ConfigureSettingManagement();
        builder.ConfigureTenantManagement();
        builder.ConfigureFeatureManagement();

        // ================= DOMAIN REGISTRATION =================
        
        // --- MAGAZA TABLOSU ---
        builder.Entity<Magaza>(b =>
        {
            b.ConfigureByConvention();
            b.Property(x => x.KomisyonOrani).HasPrecision(18, 2);
            b.Property(x => x.MinimumKomisyonEsigi).HasPrecision(18, 2);
        });

        builder.Entity<Kullanici>();
        
        // --- KULLANICI PROFİLİ TABLOSU ---
        builder.Entity<KullaniciProfil>(b =>
        {
            b.ConfigureByConvention();
            b.Property(x => x.Boy).HasPrecision(18, 2);
            b.Property(x => x.Kilo).HasPrecision(18, 2);
        });

        builder.Entity<Urun>();

        // --- YORUMLAR TABLOSU PERFORMANS OPTİMİZASYONU & İLİŞKİ DÜZENLEMESİ ---
        builder.Entity<Yorum>(b =>
        {
            b.ConfigureByConvention();

            b.HasOne(y => y.Urun)
             .WithMany()
             .HasForeignKey(y => y.UrunId)
             .OnDelete(DeleteBehavior.NoAction);

            b.HasOne(y => y.Magaza)
             .WithMany()
             .HasForeignKey(y => y.MagazaId)
             .OnDelete(DeleteBehavior.NoAction);

            // Eski shadow property'yi yoksay
            b.Ignore("UrunId1");

            b.HasIndex(x => new { x.MagazaId, x.NlpIslendi });
            b.HasIndex(x => x.UrunId);
        });

        builder.Entity<PlatformBaglantisi>();
        builder.Entity<SenkronizasyonLog>();

        builder.Entity<AiTalimat>();

        // --- NLP BULGULARI TABLOSU PERFORMANS OPTİMİZASYONU ---
        builder.Entity<NlpBulgusu>(b =>
        {
            b.ConfigureByConvention();
            
            // Decimal precision configuration
            b.Property(x => x.DuyguSkoru).HasPrecision(18, 2);

            // Analytics servisinin GroupBy ve Where (MagazaId) sorgularını uçuracak index
            b.HasIndex(x => x.MagazaId);
            b.HasIndex(x => x.UrunId);
        });

        builder.Entity<Bildirim>();
        builder.Entity<OnboardingAdim>();

        // --- KOMİSYON KAYDI TABLOSU ---
        builder.Entity<KomisyonKaydi>(b =>
        {
            b.ConfigureByConvention();
            b.Property(x => x.KomisyonOrani).HasPrecision(18, 2);
            b.Property(x => x.KomisyonTutari).HasPrecision(18, 2);
            b.Property(x => x.SatisTutari).HasPrecision(18, 2);
        });

        // --- VÜCUT UYUM SKORU TABLOSU ---
        builder.Entity<VucutUyumSkoru>(b =>
        {
            b.ConfigureByConvention();
            b.Property(x => x.UyumSkoru).HasPrecision(18, 2);
            b.Property(x => x.IadeRiski).HasPrecision(18, 2);
        });

        // --- WIDGET SORGU LOG TABLOSU ---
        builder.Entity<WidgetSorguLog>(b =>
        {
            b.ConfigureByConvention();
            b.Property(x => x.DonulenUyumSkoru).HasPrecision(18, 2);
        });

        builder.ConfigureBackgroundJobs();
    }
}