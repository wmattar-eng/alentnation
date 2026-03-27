import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../models/sponsor_model.dart';
import '../services/sponsor_service.dart';
import '../widgets/campaign_card.dart';
import '../widgets/stat_card.dart';

class SponsorDashboardScreen extends StatefulWidget {
  const SponsorDashboardScreen({Key? key}) : super(key: key);

  @override
  State<SponsorDashboardScreen> createState() => _SponsorDashboardScreenState();
}

class _SponsorDashboardScreenState extends State<SponsorDashboardScreen> {
  SponsorAnalytics? _analytics;
  List<Campaign> _campaigns = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final service = SponsorService();
      final [analytics, campaigns] = await Future.wait([
        service.getAnalytics(),
        service.getCampaigns(),
      ]);

      setState(() {
        _analytics = analytics as SponsorAnalytics;
        _campaigns = campaigns as List<Campaign>;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading data: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Sponsor Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications),
            onPressed: () {
              // Show notifications
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Stats Row
              _buildStatsRow(),
              const SizedBox(height: 24),

              // Quick Actions
              _buildQuickActions(),
              const SizedBox(height: 24),

              // Active Campaigns
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Active Campaigns',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  TextButton(
                    onPressed: () {
                      Navigator.pushNamed(context, '/sponsors/campaigns');
                    },
                    child: const Text('See All'),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              _buildCampaignsList(),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.pushNamed(context, '/sponsors/campaigns/create');
        },
        icon: const Icon(Icons.add),
        label: const Text('New Campaign'),
      ),
    );
  }

  Widget _buildStatsRow() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          StatCard(
            title: 'Active',
            value: '${_analytics?.activeCampaigns ?? 0}',
            icon: Icons.campaign,
            color: Colors.blue,
          ),
          const SizedBox(width: 12),
          StatCard(
            title: 'Spend',
            value: '${_analytics?.totalSpend.toStringAsFixed(0) ?? 0} SAR',
            icon: Icons.account_balance_wallet,
            color: Colors.green,
          ),
          const SizedBox(width: 12),
          StatCard(
            title: 'Impressions',
            value: '${_analytics?.totalImpressions ?? 0}',
            icon: Icons.visibility,
            color: Colors.purple,
          ),
          const SizedBox(width: 12),
          StatCard(
            title: 'CTR',
            value: '${_analytics?.ctr ?? 0}%',
            icon: Icons.trending_up,
            color: Colors.orange,
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Quick Actions',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                _buildActionButton(
                  icon: Icons.add_circle,
                  label: 'Create\nCampaign',
                  onTap: () => Navigator.pushNamed(
                    context,
                    '/sponsors/campaigns/create',
                  ),
                ),
                _buildActionButton(
                  icon: Icons.account_balance,
                  label: 'Add\nFunds',
                  onTap: () => Navigator.pushNamed(
                    context,
                    '/sponsors/wallet',
                  ),
                ),
                _buildActionButton(
                  icon: Icons.analytics,
                  label: 'View\nReports',
                  onTap: () => Navigator.pushNamed(
                    context,
                    '/sponsors/analytics',
                  ),
                ),
                _buildActionButton(
                  icon: Icons.settings,
                  label: 'Settings',
                  onTap: () => Navigator.pushNamed(
                    context,
                    '/sponsors/settings',
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Column(
            children: [
              Icon(icon, size: 28, color: Theme.of(context).primaryColor),
              const SizedBox(height: 8),
              Text(
                label,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 12),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCampaignsList() {
    final activeCampaigns = _campaigns.where((c) => c.status == 'ACTIVE').toList();

    if (activeCampaigns.isEmpty) {
      return Center(
        child: Column(
          children: [
            const Icon(Icons.campaign_outlined, size: 64, color: Colors.grey),
            const SizedBox(height: 16),
            const Text('No active campaigns'),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: () {
                Navigator.pushNamed(context, '/sponsors/campaigns/create');
              },
              child: const Text('Create Your First Campaign'),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: activeCampaigns.take(3).length,
      itemBuilder: (context, index) {
        final campaign = activeCampaigns[index];
        return CampaignCard(
          campaign: campaign,
          onTap: () => Navigator.pushNamed(
            context,
            '/sponsors/campaigns/${campaign.id}',
          ),
        );
      },
    );
  }
}
