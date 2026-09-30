using System;

namespace FitAI.Analytics;

public class ReviewDto
{
    public int Id { get; set; }
    public string Kullanici { get; set; } = string.Empty;
    public int Yildiz { get; set; }
    public string Metin { get; set; } = string.Empty;
    public string DuyguEtiketi { get; set; } = "Belirsiz";
    public double DuyguSkoru { get; set; }
    public string Tema { get; set; } = "genel";
    public DateTime Zaman { get; set; }
}