using SendgridParquetLogger.Helper;

namespace SendgridParquetLogger.Test
{
    public class RequestValidatorTest
    {
        [SetUp]
        public void Setup()
        {
        }

        [Test]
        public void Pass()
        {
            var validator = new RequestValidator();
        }
    }
}
