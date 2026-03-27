import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/sponsor_model.dart';

class SponsorService {
  static const String baseUrl = 'https://api.talentnation.sa/api/v1';
  String? _authToken;

  void setAuthToken(String token) {
    _authToken = token;
  }

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_authToken != null) 'Authorization': 'Bearer $_authToken',
  };

  // Register as sponsor
  Future<Sponsor> registerSponsor({
    required String companyName,
    String? website,
    String? logoUrl,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/sponsors/register'),
      headers: _headers,
      body: jsonEncode({
        'companyName': companyName,
        'website': website,
        'logoUrl': logoUrl,
      }),
    );

    if (response.statusCode == 201) {
      return Sponsor.fromJson(jsonDecode(response.body)['data']);
    }
    throw Exception(jsonDecode(response.body)['error'] ?? 'Failed to register');
  }

  // Get sponsor profile
  Future<Sponsor> getSponsorProfile() async {
    final response = await http.get(
      Uri.parse('$baseUrl/sponsors/profile'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      return Sponsor.fromJson(jsonDecode(response.body)['data']);
    }
    throw Exception('Failed to load profile');
  }

  // Create campaign
  Future<Campaign> createCampaign({
    required String name,
    required String type,
    required String tier,
    required String headline,
    String? description,
    required String ctaText,
    required String ctaUrl,
    required double budget,
    required int duration,
  }) async {
    final now = DateTime.now();
    final endDate = now.add(Duration(days: duration));

    final response = await http.post(
      Uri.parse('$baseUrl/sponsors/campaigns'),
      headers: _headers,
      body: jsonEncode({
        'name': name,
        'type': type,
        'tier': tier,
        'headline': headline,
        'description': description,
        'ctaText': ctaText,
        'ctaUrl': ctaUrl,
        'budget': budget,
        'startDate': now.toIso8601String(),
        'endDate': endDate.toIso8601String(),
      }),
    );

    if (response.statusCode == 201) {
      return Campaign.fromJson(jsonDecode(response.body)['data']);
    }
    throw Exception(jsonDecode(response.body)['error'] ?? 'Failed to create campaign');
  }

  // Get all campaigns
  Future<List<Campaign>> getCampaigns() async {
    final response = await http.get(
      Uri.parse('$baseUrl/sponsors/campaigns'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body)['data'];
      return data.map((c) => Campaign.fromJson(c)).toList();
    }
    throw Exception('Failed to load campaigns');
  }

  // Get analytics
  Future<SponsorAnalytics> getAnalytics() async {
    final response = await http.get(
      Uri.parse('$baseUrl/sponsors/analytics/dashboard'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      return SponsorAnalytics.fromJson(jsonDecode(response.body)['data']);
    }
    throw Exception('Failed to load analytics');
  }

  // Pause campaign
  Future<void> pauseCampaign(String campaignId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/sponsors/campaigns/$campaignId/pause'),
      headers: _headers,
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to pause campaign');
    }
  }

  // Resume campaign
  Future<void> resumeCampaign(String campaignId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/sponsors/campaigns/$campaignId/resume'),
      headers: _headers,
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to resume campaign');
    }
  }

  // Fund campaign with payment
  Future<Map<String, dynamic>> fundCampaign({
    required String campaignId,
    required double amount,
    required String paymentMethod, // 'stripe' or 'hyperpay'
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/sponsors/campaigns/$campaignId/fund'),
      headers: _headers,
      body: jsonEncode({
        'amount': amount,
        'paymentMethod': paymentMethod,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body)['data'];
    }
    throw Exception(jsonDecode(response.body)['error'] ?? 'Payment failed');
  }
}
