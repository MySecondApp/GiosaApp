#!/usr/bin/env ruby

require 'yaml'
require 'set'

class TranslationChecker
  def initialize(en_file, es_file)
    @en_file = en_file
    @es_file = es_file
    @en_data = YAML.load_file(en_file)['en'] || {}
    @es_data = YAML.load_file(es_file)['es'] || {}
  end

  def check_missing_translations
    puts "🔍 Checking missing translations between English and Spanish..."
    puts "=" * 60

    en_keys = extract_keys(@en_data)
    es_keys = extract_keys(@es_data)

    missing_in_spanish = en_keys - es_keys
    missing_in_english = es_keys - en_keys

    puts "\n📊 SUMMARY:"
    puts "English keys: #{en_keys.size}"
    puts "Spanish keys: #{es_keys.size}"
    puts "Missing in Spanish: #{missing_in_spanish.size}"
    puts "Missing in English: #{missing_in_english.size}"

    if missing_in_spanish.any?
      puts "\n❌ MISSING IN SPANISH (es.yml):"
      puts "-" * 40
      missing_in_spanish.sort.each do |key|
        value = get_nested_value(@en_data, key.split('.'))
        puts "  #{key}: \"#{value}\""
      end
    end

    if missing_in_english.any?
      puts "\n❌ MISSING IN ENGLISH (en.yml):"
      puts "-" * 40
      missing_in_english.sort.each do |key|
        value = get_nested_value(@es_data, key.split('.'))
        puts "  #{key}: \"#{value}\""
      end
    end

    if missing_in_spanish.empty? && missing_in_english.empty?
      puts "\n✅ All translations are complete! Both files have matching keys."
    end

    puts "\n🔍 DETAILED COMPARISON:"
    puts "-" * 40

    # Show structure differences
    show_structure_diff
  end

  private

  def extract_keys(hash, prefix = '')
    keys = Set.new

    hash.each do |key, value|
      current_key = prefix.empty? ? key : "#{prefix}.#{key}"

      if value.is_a?(Hash)
        keys.merge(extract_keys(value, current_key))
      else
        keys.add(current_key)
      end
    end

    keys
  end

  def get_nested_value(hash, keys)
    keys.reduce(hash) { |h, key| h&.dig(key) }
  end

  def show_structure_diff
    puts "\n📋 ENGLISH STRUCTURE:"
    show_structure(@en_data, "en")

    puts "\n📋 SPANISH STRUCTURE:"
    show_structure(@es_data, "es")
  end

  def show_structure(hash, prefix = '', level = 0)
    return if level > 3  # Limit depth for readability

    hash.each do |key, value|
      indent = "  " * level
      if value.is_a?(Hash)
        puts "#{indent}#{key}:"
        show_structure(value, "#{prefix}.#{key}", level + 1)
      else
        puts "#{indent}#{key}: #{value.is_a?(String) ? value.length : value.class} #{value.is_a?(String) && value.length > 50 ? '[LONG]' : ''}"
      end
    end
  end
end

# Run the checker
if __FILE__ == $0
  en_file = File.join(__dir__, 'config', 'locales', 'en.yml')
  es_file = File.join(__dir__, 'config', 'locales', 'es.yml')

  if File.exist?(en_file) && File.exist?(es_file)
    checker = TranslationChecker.new(en_file, es_file)
    checker.check_missing_translations
  else
    puts "❌ Translation files not found!"
    puts "Expected: #{en_file}"
    puts "Expected: #{es_file}"
  end
end
