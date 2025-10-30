using System.Text.Json;
using System.Text.Json.Serialization;

namespace ProjectManager.Api.Converters
{
    public class DateOnlyJsonConverter : JsonConverter<DateOnly>
    {
        private const string DateFormat = "yyyy-MM-dd";

        public override DateOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            var value = reader.GetString();
            if (string.IsNullOrEmpty(value))
                throw new JsonException("Date value cannot be null or empty");

            if (DateOnly.TryParseExact(value, DateFormat, out var date))
                return date;

            throw new JsonException($"Date must be in format {DateFormat}");
        }

        public override void Write(Utf8JsonWriter writer, DateOnly value, JsonSerializerOptions options)
        {
            writer.WriteStringValue(value.ToString(DateFormat));
        }
    }

    public class NullableDateOnlyJsonConverter : JsonConverter<DateOnly?>
    {
        private const string DateFormat = "yyyy-MM-dd";

        public override DateOnly? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            var value = reader.GetString();
            if (string.IsNullOrEmpty(value))
                return null;

            if (DateOnly.TryParseExact(value, DateFormat, out var date))
                return date;

            throw new JsonException($"Date must be in format {DateFormat}");
        }

        public override void Write(Utf8JsonWriter writer, DateOnly? value, JsonSerializerOptions options)
        {
            if (value.HasValue)
                writer.WriteStringValue(value.Value.ToString(DateFormat));
            else
                writer.WriteNullValue();
        }
    }
}