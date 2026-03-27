import 'package:flutter/material.dart';
import '../models/sponsor_model.dart';
import '../services/sponsor_service.dart';

class CreateCampaignScreen extends StatefulWidget {
  const CreateCampaignScreen({Key? key}) : super(key: key);

  @override
  State<CreateCampaignScreen> createState() => _CreateCampaignScreenState();
}

class _CreateCampaignScreenState extends State<CreateCampaignScreen> {
  final _formKey = GlobalKey<FormState>();
  final _service = SponsorService();

  // Form values
  String _selectedTier = 'BRONZE';
  String _campaignType = 'PROJECT_SPONSORED';
  final _nameController = TextEditingController();
  final _headlineController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _ctaTextController = TextEditingController(text: 'Apply Now');
  final _ctaUrlController = TextEditingController();
  final _budgetController = TextEditingController(text: '500');
  int _duration = 30;

  final List<Map<String, dynamic>> _tiers = [
    {
      'value': 'BRONZE',
      'label': 'Bronze',
      'price': 500,
      'features': ['Highlighted badge', 'Top 3 placement', 'Basic analytics'],
      'color': Colors.brown,
    },
    {
      'value': 'SILVER',
      'label': 'Silver',
      'price': 1500,
      'features': ['Featured banner', 'Top placement', 'Advanced analytics', 'Priority support'],
      'color': Colors.grey,
    },
    {
      'value': 'GOLD',
      'label': 'Gold',
      'price': 5000,
      'features': ['Homepage spot', 'Push notifications', 'Dedicated account manager'],
      'color': Colors.amber,
    },
    {
      'value': 'PLATINUM',
      'label': 'Platinum',
      'price': 15000,
      'features': ['Exclusive placement', 'Custom branding', 'API access', 'White-glove service'],
      'color': Colors.blueGrey,
    },
  ];

  final List<Map<String, String>> _campaignTypes = [
    {'value': 'PROJECT_SPONSORED', 'label': 'Featured Project', 'desc': 'Sponsored project listing'},
    {'value': 'HOMEPAGE_HERO', 'label': 'Homepage Hero', 'desc': 'Large banner on homepage'},
    {'value': 'SEARCH_SPONSORED', 'label': 'Search Result', 'desc': 'Top placement in search'},
    {'value': 'TALENT_FEATURED', 'label': 'Featured Talent', 'desc': 'Promote talent profiles'},
    {'value': 'SIDEBAR_AD', 'label': 'Sidebar Ad', 'desc': 'Sidebar advertisement'},
    {'value': 'PUSH_NOTIFICATION', 'label': 'Push Notification', 'desc': 'Mobile push ad'},
    {'value': 'EMAIL_SPOTLIGHT', 'label': 'Email Spotlight', 'desc': 'Featured in email digest'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Campaign'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Tier Selection
            _buildTierSelection(),
            const SizedBox(height: 24),

            // Campaign Type
            _buildCampaignTypeSelection(),
            const SizedBox(height: 24),

            // Campaign Details
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Campaign Details',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _nameController,
                      decoration: const InputDecoration(
                        labelText: 'Campaign Name',
                        hintText: 'Summer 2024 Hiring Drive',
                      ),
                      validator: (value) =>
                          value?.isEmpty ?? true ? 'Required' : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _headlineController,
                      decoration: const InputDecoration(
                        labelText: 'Headline',
                        hintText: 'Looking for top designers',
                        counterText: 'Max 100 chars',
                      ),
                      maxLength: 100,
                      validator: (value) =>
                          value?.isEmpty ?? true ? 'Required' : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _descriptionController,
                      decoration: const InputDecoration(
                        labelText: 'Description',
                        hintText: 'Describe your campaign...',
                      ),
                      maxLines: 3,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // CTA Settings
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Call to Action',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _ctaTextController,
                      decoration: const InputDecoration(
                        labelText: 'Button Text',
                        hintText: 'Apply Now',
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _ctaUrlController,
                      decoration: const InputDecoration(
                        labelText: 'Destination URL',
                        hintText: 'https://your-company.com/careers',
                      ),
                      keyboardType: TextInputType.url,
                      validator: (value) => value?.isEmpty ?? true
                          ? 'Required'
                          : !value!.startsWith('http')
                              ? 'Must start with http/https'
                              : null,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Budget & Duration
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Budget & Duration',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<int>(
                      value: _duration,
                      decoration: const InputDecoration(
                        labelText: 'Duration',
                      ),
                      items: const [
                        DropdownMenuItem(value: 7, child: Text('1 Week')),
                        DropdownMenuItem(value: 14, child: Text('2 Weeks')),
                        DropdownMenuItem(value: 30, child: Text('1 Month')),
                        DropdownMenuItem(value: 90, child: Text('3 Months')),
                      ],
                      onChanged: (value) => setState(() => _duration = value!),
                    ),
                    const SizedBox(height: 24),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Theme.of(context).primaryColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Total Budget'),
                              Text(
                                '$_duration days · $_selectedTier tier',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                            ],
                          ),
                          Text(
                            '${_getSelectedTierPrice()} SAR',
                            style: Theme.of(context)
                                .textTheme
                                .headlineSmall
                                ?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: Theme.of(context).primaryColor,
                                ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 32),

            // Submit Button
            SizedBox(
              height: 50,
              child: ElevatedButton(
                onPressed: _createCampaign,
                child: const Text(
                  'Create & Pay',
                  style: TextStyle(fontSize: 16),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTierSelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Select Tier',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 200,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: _tiers.length,
            itemBuilder: (context, index) {
              final tier = _tiers[index];
              final isSelected = _selectedTier == tier['value'];

              return GestureDetector(
                onTap: () => setState(() => _selectedTier = tier['value']),
                child: Container(
                  width: 160,
                  margin: const EdgeInsets.only(right: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? (tier['color'] as Color).withOpacity(0.1)
                        : Colors.grey.shade100,
                    border: Border.all(
                      color: isSelected
                          ? tier['color'] as Color
                          : Colors.transparent,
                      width: 2,
                    ),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        tier['label'],
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: tier['color'] as Color,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '${tier['price']} SAR',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const Text('/month', style: TextStyle(fontSize: 12)),
                      const SizedBox(height: 8),
                      ...((tier['features'] as List<String>).map((f) => Text(
                            '• $f',
                            style: const TextStyle(fontSize: 11),
                          ))),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildCampaignTypeSelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Campaign Type',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _campaignTypes.map((type) {
            final isSelected = _campaignType == type['value'];
            return ChoiceChip(
              label: Text(type['label']!),
              selected: isSelected,
              onSelected: (selected) {
                if (selected) setState(() => _campaignType = type['value']!);
              },
            );
          }).toList(),
        ),
      ],
    );
  }

  int _getSelectedTierPrice() {
    return _tiers.firstWhere((t) => t['value'] == _selectedTier)['price'] as int;
  }

  Future<void> _createCampaign() async {
    if (!_formKey.currentState!.validate()) return;

    try {
      final campaign = await _service.createCampaign(
        name: _nameController.text,
        type: _campaignType,
        tier: _selectedTier,
        headline: _headlineController.text,
        description: _descriptionController.text,
        ctaText: _ctaTextController.text,
        ctaUrl: _ctaUrlController.text,
        budget: _getSelectedTierPrice().toDouble(),
        duration: _duration,
      );

      // Navigate to payment
      Navigator.pushNamed(
        context,
        '/sponsors/campaigns/${campaign.id}/payment',
        arguments: {'amount': _getSelectedTierPrice()},
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  }
}
