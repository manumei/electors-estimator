import numpy as np
import math
import random
import matplotlib.pyplot as plt
import pandas as pd
from colorama import Style, Fore
from typing import List, Tuple, Dict, Any, Union, Optional

def population_reader(csv_file):
    ''' Given a CSV file with 3 columns separated as follows:
        State Name: str,State Abbreviation: str,Population: int
        This function will return a dictionary with the state abbreviation as the key and the population as the value
    '''
    population = pd.read_csv(csv_file)
    population_dict = dict(zip(population['State Abbreviation'],population['Population']))
    return population_dict

def electors_reader(csv_file):
    ''' Given a CSV file with 3 columns separated as follows:
        State Name: str,State Abbreviation: str,Electors: int
        This function will return a dictionary with the state abbreviation as the key and the electors as the value
    '''
    electors = pd.read_csv(csv_file)
    electors_dict = dict(zip(electors['State Abbreviation'],electors['Electors']))
    return electors_dict

def allocate_house_seats(states_number: int, populations: Tuple[int]) -> np.array:
    """
    Allocate the 435 House seats among the states based on their populations using the method of equal proportions.

    Args:
        states_number (int): The number of states.
        populations (Tuple[int]): A tuple of state populations.

    Returns:
        np.array: A numpy array of House seats allocated to each state.
    """
    # Start with 1 seat for each state
    seats = np.ones(states_number, dtype=int)

    # Priority values for each state
    priority_values = np.array([pop / math.sqrt(seats[i] * (seats[i] + 1)) for i, pop in enumerate(populations)])

    # Assign the remaining 435 - states_number seats
    total_seats = 435
    remaining_seats = total_seats - states_number

    for _ in range(remaining_seats):
        # Find the state with the highest priority value
        max_index = np.argmax(priority_values)

        # Assign one more seat to that state
        seats[max_index] += 1

        # Recalculate the priority value for that state
        priority_values[max_index] = populations[max_index] / math.sqrt(seats[max_index] * (seats[max_index] + 1))

    return seats

def calculate_electors(states_number: int, populations: Tuple[int]) -> np.array:
    """ Calculates the electors (House Reps + Senators) for each state based on the population.

    Args:
        states_number (int): The number of states in the Union
        populations (Tuple[int]): A tuple of state populations

    Returns:
        np.array: An array of electors allocated to each state, ordered by the same index as the populations 
        such that the ith element of the populations tuple corresponds to the ith element of the returned list
    """

    house_electors = allocate_house_seats(states_number, populations)
    
    # For the total electors, add +2 to each state
    total_electors = house_electors + 2
    
    return total_electors

# Test with the file named 2024_dataset.csv
read_elecs_24 = electors_reader('2024_dataset.csv')
data_elecs_24 = {
    'AL': 9, 'AK': 3, 'AZ': 11, 'AR': 6, 'CA': 54, 'CO': 10, 'CT': 7,
    'DE': 3, 'FL': 30, 'GA': 16, 'HI': 4, 'ID': 4, 'IL': 19,
    'IN': 11, 'IA': 6, 'KS': 6, 'KY': 8, 'LA': 8, 'ME': 4, 'MD': 10,
    'MA': 11, 'MI': 15, 'MN': 10, 'MS': 6, 'MO': 10, 'MT': 4, 'NE': 5,
    'NV': 6, 'NH': 4, 'NJ': 14, 'NM': 5, 'NY': 28, 'NC': 16, 'ND': 3,
    'OH': 17, 'OK': 7, 'OR': 8, 'PA': 19, 'RI': 4, 'SC': 9, 'SD': 3,
    'TN': 11, 'TX': 40, 'UT': 6, 'VT': 3, 'VA': 13, 'WA': 12, 'WV': 4,
    'WI': 10, 'WY': 3
}

read_pops_24 = population_reader('populations.csv')
data_pops_24 = {
    "AL": 5024279, "AK": 733391, "AZ": 7151502, "AR": 3011524, "CA": 39538223, "CO": 5773714, "CT": 3605944,
    "DE": 989948, "FL": 21538187, "GA": 10711908, "HI": 1455271, "ID": 1839106, "IL": 12812508,
    "IN": 6785528, "IA": 3190369, "KS": 2937880, "KY": 4505836, "LA": 4657757, "ME": 1362359, "MD": 6177224,
    "MA": 7029917, "MI": 10077331, "MN": 5706494, "MS": 2961279, "MO": 6154913, "MT": 1084225, "NE": 1961504,
    "NV": 3104614, "NH": 1377529, "NJ": 9288994, "NM": 2117522, "NY": 20201249, "NC": 10439388, "ND": 779094,
    "OH": 11799448, "OK": 3959353, "OR": 4237256, "PA": 13002700, "RI": 1097379, "SC": 5118425, "SD": 886667,
    "TN": 6910840, "TX": 29145505, "UT": 3271616, "VT": 643077, "VA": 8631393, "WA": 7705281, "WV": 1793716,
    "WI": 5893718, "WY": 576851
}

pops_values_24 = tuple(read_pops_24.values())
electors_pred_24 = calculate_electors(states_number=50, populations=pops_values_24)
pred_elecs_24_list = electors_pred_24.tolist()
true_elecs_24_list = list(data_elecs_24.values())

# Tests
assert read_elecs_24 == data_elecs_24, Style.BRIGHT + Fore.RED + f'Error!\nOur Data was {read_elecs_24} while\nTrue Data is {data_elecs_24}' + Style.RESET_ALL
assert read_pops_24 == data_pops_24, Style.BRIGHT + Fore.RED + f'Error!\nOur Data was {read_pops_24} while\nTrue Data is {data_pops_24}' + Style.RESET_ALL
assert pred_elecs_24_list == true_elecs_24_list, Style.BRIGHT + Fore.RED + f'Error!\nOur Data was {pred_elecs_24_list} while\nTrue Data is {true_elecs_24_list}' + Style.RESET_ALL

print(Style.BRIGHT + Fore.GREEN + 'Tests passed!' + Style.RESET_ALL + '\n')

# elecs_24_keys = list(data_elecs_24.keys())
# for i in range(len(elecs_24_keys)):
#     print(f'True Data was {elecs_24_keys[i]}: {true_elecs_24_list[i]}')
#     print(f'Our Prediction was {elecs_24_keys[i]}: {pred_elecs_24_list[i]}')
#     print('')

