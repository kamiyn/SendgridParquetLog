using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Components;

namespace SendgridParquetViewer.Components.Pages;

public partial class HomeSearchConditions : ComponentBase
{
    [Parameter]
    public string SelectedEmail { get; set; } = string.Empty;

    [Parameter]
    public EventCallback<string> SelectedEmailChanged { get; set; }

    [Parameter]
    public string SelectedSgTemplateId { get; set; } = string.Empty;

    [Parameter]
    public EventCallback<string> SelectedSgTemplateIdChanged { get; set; }

    [Parameter]
    public string SelectedEventType { get; set; } = string.Empty;

    [Parameter]
    public EventCallback<string> SelectedEventTypeChanged { get; set; }

    [Parameter]
    public IReadOnlyList<(string Value, string Display)> EventTypes { get; set; } = Array.Empty<(string Value, string Display)>();

    [Parameter]
    public DateTime? CurrentMonthDate { get; set; }

    [Parameter]
    public EventCallback<DateTime?> CurrentMonthDateChanged { get; set; }

    [Parameter]
    public EventCallback MonthPickerAfterChanged { get; set; }

    [Parameter]
    public bool IsDownloading { get; set; }

    [Parameter]
    public bool IsLoading { get; set; }

    [Parameter]
    public int? SelectedDay { get; set; }

    [Parameter]
    public EventCallback<int> ChangeMonthRequested { get; set; }

    [Parameter]
    public EventCallback EnsureMonthDataRequested { get; set; }

    [Parameter]
    public EventCallback SearchRequested { get; set; }

    [Parameter]
    public EventCallback FilterChanged { get; set; }

    [Parameter]
    public EventCallback EventTypeChanged { get; set; }

    private Task HandleFilterChanged(ChangeEventArgs _) => FilterChanged.InvokeAsync();

    private Task HandleEventTypeChanged(ChangeEventArgs _) => EventTypeChanged.InvokeAsync();

    private Task HandleMonthPickerAfterChanged() => MonthPickerAfterChanged.InvokeAsync();

    private Task ChangeMonthAsync(int delta)
    {
        return ChangeMonthRequested.InvokeAsync(delta);
    }

    private Task EnsureMonthDataAsync() => EnsureMonthDataRequested.InvokeAsync();

    private Task SearchAsync() => SearchRequested.InvokeAsync();
}
