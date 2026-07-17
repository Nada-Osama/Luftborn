namespace Luftborn.BLL.Exceptions;

// Thrown when a requested entity does not exist
public class NotFoundException : Exception
{
    public NotFoundException(string entityName, int id)
        : base($"{entityName} with id {id} was not found.")
    {
    }
}

// Thrown when an operation would violate a business rule
public class BusinessRuleException : Exception
{
    public BusinessRuleException(string message) : base(message)
    {
    }
}
