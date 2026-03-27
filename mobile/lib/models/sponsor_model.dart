class SponsorAnalytics {
  final int activeCampaigns;
  final double totalSpend;
  final int totalImpressions;
  final int totalClicks;
  final int totalConversions;
  final double ctr;
  final double conversionRate;
  final List<CampaignSummary> campaigns;

  SponsorAnalytics({
    required this.activeCampaigns,
    required this.totalSpend,
    required this.totalImpressions,
    required this.totalClicks,
    required this.totalConversions,
    required this.ctr,
    required this.conversionRate,
    required this.campaigns,
  });

  factory SponsorAnalytics.fromJson(Map<String, dynamic> json) {
    return SponsorAnalytics(
      activeCampaigns: json['activeCampaigns'] ?? 0,
      totalSpend: (json['totalSpend'] ?? 0).toDouble(),
      totalImpressions: json['totalImpressions'] ?? 0,
      totalClicks: json['totalClicks'] ?? 0,
      totalConversions: json['totalConversions'] ?? 0,
      ctr: (json['ctr'] ?? 0).toDouble(),
      conversionRate: (json['conversionRate'] ?? 0).toDouble(),
      campaigns: (json['campaigns'] as List?)
              ?.map((c) => CampaignSummary.fromJson(c))
              .toList() ??
          [],
    );
  }
}

class CampaignSummary {
  final String id;
  final String name;
  final String status;
  final double budget;
  final int impressions;
  final int clicks;
  final int conversions;
  final double? ctr;

  CampaignSummary({
    required this.id,
    required this.name,
    required this.status,
    required this.budget,
    required this.impressions,
    required this.clicks,
    required this.conversions,
    this.ctr,
  });

  factory CampaignSummary.fromJson(Map<String, dynamic> json) {
    return CampaignSummary(
      id: json['id'],
      name: json['name'],
      status: json['status'],
      budget: (json['budget'] ?? 0).toDouble(),
      impressions: json['impressions'] ?? 0,
      clicks: json['clicks'] ?? 0,
      conversions: json['conversions'] ?? 0,
      ctr: json['ctr']?.toDouble(),
    );
  }
}

class Campaign {
  final String id;
  final String name;
  final String type;
  final String status;
  final String headline;
  final String? description;
  final double budget;
  final int impressions;
  final int clicks;
  final int conversions;
  final double? ctr;
  final DateTime? startDate;
  final DateTime? endDate;

  Campaign({
    required this.id,
    required this.name,
    required this.type,
    required this.status,
    required this.headline,
    this.description,
    required this.budget,
    this.impressions = 0,
    this.clicks = 0,
    this.conversions = 0,
    this.ctr,
    this.startDate,
    this.endDate,
  });

  factory Campaign.fromJson(Map<String, dynamic> json) {
    return Campaign(
      id: json['id'],
      name: json['name'],
      type: json['type'],
      status: json['status'],
      headline: json['headline'],
      description: json['description'],
      budget: (json['budget'] ?? 0).toDouble(),
      impressions: json['impressions'] ?? 0,
      clicks: json['clicks'] ?? 0,
      conversions: json['conversions'] ?? 0,
      ctr: json['ctr']?.toDouble(),
      startDate: json['startDate'] != null
          ? DateTime.parse(json['startDate'])
          : null,
      endDate: json['endDate'] != null
          ? DateTime.parse(json['endDate'])
          : null,
    );
  }
}

class Sponsor {
  final String id;
  final String companyName;
  final String? logoUrl;
  final String? website;
  final String tier;
  final double budgetTotal;
  final double budgetSpent;
  final bool isActive;

  Sponsor({
    required this.id,
    required this.companyName,
    this.logoUrl,
    this.website,
    required this.tier,
    required this.budgetTotal,
    required this.budgetSpent,
    required this.isActive,
  });

  factory Sponsor.fromJson(Map<String, dynamic> json) {
    return Sponsor(
      id: json['id'],
      companyName: json['companyName'],
      logoUrl: json['logoUrl'],
      website: json['website'],
      tier: json['tier'],
      budgetTotal: (json['budgetTotal'] ?? 0).toDouble(),
      budgetSpent: (json['budgetSpent'] ?? 0).toDouble(),
      isActive: json['isActive'] ?? true,
    );
  }
}
