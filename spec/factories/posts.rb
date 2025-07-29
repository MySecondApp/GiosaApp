FactoryBot.define do
  factory :post do
    title { Faker::Lorem.sentence(word_count: 3) }
    content { Faker::Lorem.paragraph(sentence_count: 5) }
    published { [ true, false ].sample }
  end

  factory :published_post, parent: :post do
    published { true }
  end

  factory :draft_post, parent: :post do
    published { false }
  end
end
