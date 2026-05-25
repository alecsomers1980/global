export const packageType = {
  name: 'package',
  title: 'Packages & Add-ons',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'A short catchy subtitle (e.g., "The perfect family getaway")',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Detailed description of what the package includes.',
    },
    {
      name: 'price',
      title: 'Price (ZAR)',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    },
    {
      name: 'image',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'features',
      title: 'Included Features',
      type: 'array',
      of: [{type: 'string'}],
      description: 'List of things included (e.g., "Breakfast included", "2-hour Game Drive")',
    },
    {
      name: 'isPopular',
      title: 'Mark as Popular',
      type: 'boolean',
      description: 'Highlights this package on the website.',
      initialValue: false,
    }
  ],
}
